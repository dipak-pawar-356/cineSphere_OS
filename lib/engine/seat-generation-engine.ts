import {
  GeneratedSeatTemplate,
  GenerateSeatsInput,
  SeatTemplateContainer,
  SectionGenerationSummary,
  ShowInventoryContract,
} from "@/types/seat-generation.types";
import { SeatCategoryTier, SeatStatus, SeatType, ShowSeat } from "@/types";
import { getCategoryDesignTokens } from "@/lib/constants/seating-design-system";

/**
 * ==============================================================================
 * CineSphere OS — Automatic Seat Generation Engine
 * ==============================================================================
 * Core Principles:
 * 1. Deterministic Algorithm: Identical input produces identical output.
 * 2. Immutable Seat IDs: Stable UUIDs decoupled from mutable display labels.
 * 3. Zero Embedded Pricing: Prices belong strictly to Show Programming.
 * 4. Spatial Geometry: 3D coordinates & spectator eye camera anchors embedded.
 * ==============================================================================
 */

/**
 * Deterministic pseudo-UUID generator from a seed string.
 * Ensures that re-generating a hall template produces identical immutable IDs
 * so existing bookings and reservation records remain permanently valid.
 */
export function generateDeterministicSeatId(
  hallId: string,
  sectionId: string,
  seatIndex: number
): string {
  const seed = `${hallId}::${sectionId}::seat_${seatIndex}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = ((h1 >>> 0) + 0x100000000).toString(16).slice(1);
  const hex2 = ((h2 >>> 0) + 0x100000000).toString(16).slice(1);

  return `seat-${hex1.slice(0, 8)}-${hex1.slice(4, 8)}-${hex2.slice(0, 4)}-${hex2.slice(4, 12)}`;
}

/**
 * Computes alphanumeric row prefix: A, B, C... Z, AA, AB...
 */
export function getRowLetter(index: number): string {
  let label = "";
  let num = index;
  do {
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);
  return label;
}

/**
 * Derives physical hardware seat type from category tier
 */
export function deriveSeatTypeFromCategory(category?: SeatCategoryTier): SeatType {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("recliner")) return "Recliner";
  if (normalized.includes("vip") || normalized.includes("royal")) return "VIP";
  if (normalized.includes("wheelchair") || normalized.includes("access")) return "Wheelchair";
  if (normalized.includes("sofa") || normalized.includes("couple")) return "Couple";
  return "Standard";
}

/**
 * Generates an entire reusable Seat Template for a cinema auditorium.
 * Strict Rule: Hall Capacity must exactly equal the sum of all section seat counts.
 */
export function generateAuditoriumSeatTemplate(input: GenerateSeatsInput): SeatTemplateContainer {
  const { hallId, theatreId, capacity, sections, name = "Primary Seating Template" } = input;

  // 1. Capacity Equality Validation
  const totalConfiguredSeats = sections.reduce(
    (acc, sec) => acc + (Number(sec.seatCount) || 0),
    0
  );

  if (totalConfiguredSeats !== capacity) {
    throw new Error(
      `Capacity Mismatch Error: Hall capacity is ${capacity}, but sections total ${totalConfiguredSeats} seats. Difference: ${
        capacity - totalConfiguredSeats
      } seats.`
    );
  }

  // 2. Sort sections deterministically by display/sort order
  const sortedSections = [...sections].sort((a, b) => {
    const orderA = a.sortOrder ?? a.displayOrder ?? 0;
    const orderB = b.sortOrder ?? b.displayOrder ?? 0;
    return orderA - orderB;
  });

  const allGeneratedSeats: GeneratedSeatTemplate[] = [];
  const sectionsSummary: SectionGenerationSummary[] = [];

  const templateId = input.layoutId || `tpl-${hallId}`;
  let globalSeatOrder = 1;
  let globalRowIndex = 0;

  // 3. Generate seats section by section
  sortedSections.forEach((section, sIndex) => {
    const seatCount = Number(section.seatCount) || 0;
    const seatsPerRow = Math.max(1, Number(section.seatsPerRow) || 10);
    const category: SeatCategoryTier = section.category || "Silver";
    const seatType = deriveSeatTypeFromCategory(category);
    const tokens = getCategoryDesignTokens(category);

    const sectionPrefix = getRowLetter(sIndex); // Section A -> 'A', Section B -> 'B', Section C -> 'C'
    const sectionRowLabels: string[] = [];
    const sectionSeats: GeneratedSeatTemplate[] = [];

    const isRecliner = seatType === "Recliner" || category.toLowerCase().includes("recliner");
    const isVIP = seatType === "VIP" || category.toLowerCase().includes("vip");
    const isWheelchair = seatType === "Wheelchair" || category.toLowerCase().includes("wheelchair");

    let currentSeatInSec = 1;

    while (currentSeatInSec <= seatCount) {
      const rowLetter = getRowLetter(globalRowIndex);
      sectionRowLabels.push(rowLetter);

      const seatsInThisRow = Math.min(seatsPerRow, seatCount - currentSeatInSec + 1);

      for (let col = 1; col <= seatsInThisRow; col++) {
        // Seat Label formats:
        // Section A: A1, A2... A20
        // Section B: B1, B2... B30
        // Section C: C1, C2... C50
        const seatLabel = `${sectionPrefix}${currentSeatInSec}`;
        const seatNumber = `${rowLetter}${col}`;
        const immutableId = generateDeterministicSeatId(hallId, section.id, currentSeatInSec);

        // Calculate spatial 3D geometry coordinates
        const seatPitch = isRecliner ? 1.1 : 0.85; // meters
        const rowElevation = isRecliner ? 0.45 : 0.35; // meters
        const rowSpacing = isRecliner ? 1.35 : 1.1; // meters

        const x = (col - (seatsInThisRow + 1) / 2) * seatPitch;
        const y = (globalRowIndex + 1) * rowElevation;
        const z = 8.5 + (globalRowIndex + 1) * rowSpacing;

        // Viewing angles towards curved screen center [0, 2.5, 0]
        const pitchDegrees = -Math.atan2(y - 2.5, z) * (180 / Math.PI);
        const yawDegrees = -Math.atan2(x, z) * (180 / Math.PI);

        const generatedSeat: GeneratedSeatTemplate = {
          id: immutableId,
          seatNumber,
          seatLabel,
          row: rowLetter,
          column: col,
          sectionId: section.id,
          sectionName: section.name,
          seatCategory: category,
          displayOrder: globalSeatOrder,
          seatType,
          status: "Available",
          hallId,
          hallLayoutId: templateId,
          templateId,
          accessibilityFlag: isWheelchair,
          reclinerFlag: isRecliner,
          vipFlag: isVIP,
          wheelchairFlag: isWheelchair,
          companionSeatFlag: isWheelchair && col === 2,
          coordinates: {
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100,
            z: Math.round(z * 100) / 100,
          },
          rotation: {
            x: Math.round(pitchDegrees * 10) / 10,
            y: Math.round(yawDegrees * 10) / 10,
            z: 0,
          },
          cameraAnchor: {
            eyePosition: [
              Math.round(x * 100) / 100,
              Math.round((y + 1.2) * 100) / 100,
              Math.round(z * 100) / 100,
            ],
            lookAt: [0, 2.5, 0],
            fov: 60,
          },
          metadata: {
            sectionColor: tokens.color,
            isAisleSeat: col === 1 || col === seatsInThisRow,
            sectionIndex: sIndex + 1,
            seatInRow: col,
            seatsInRow: seatsInThisRow,
          },
        };

        sectionSeats.push(generatedSeat);
        allGeneratedSeats.push(generatedSeat);
        globalSeatOrder++;
        currentSeatInSec++;
      }

      globalRowIndex++;
    }

    sectionsSummary.push({
      sectionId: section.id,
      sectionName: section.name,
      category,
      seatCount,
      seatsPerRow,
      rowCount: sectionRowLabels.length,
      firstSeatLabel: sectionSeats[0]?.seatLabel || `${sectionPrefix}1`,
      lastSeatLabel: sectionSeats[sectionSeats.length - 1]?.seatLabel || `${sectionPrefix}${seatCount}`,
      rowLabels: sectionRowLabels,
    });
  });

  return {
    id: templateId,
    hallId,
    theatreId,
    name,
    capacity,
    totalGeneratedSeats: allGeneratedSeats.length,
    seats: allGeneratedSeats,
    sectionsSummary,
    generatedAt: new Date().toISOString(),
    checksum: `chk-${hallId}-${capacity}-${sections.length}`,
  };
}

/**
 * Architectural Handoff Function:
 * Prepares Show Seat Inventory by combining an immutable SeatTemplateContainer + ShowPricing.
 * Leaves the original Seat Template untouched so it can be reused for thousands of shows.
 */
export function generateShowInventoryFromTemplate(
  template: SeatTemplateContainer,
  showContract: ShowInventoryContract
): ShowSeat[] {
  const { showPricing } = showContract;
  const pricingMap = showPricing.sectionPricing || {};
  const defaultPrice = showPricing.defaultPrice || 250;

  return template.seats.map((seat) => {
    const sectionPrice = pricingMap[seat.sectionId] ?? pricingMap[seat.sectionName] ?? defaultPrice;

    return {
      id: `${showContract.showId}-${seat.seatLabel}`,
      showId: showContract.showId,
      seatNumber: seat.seatLabel,
      row: seat.row,
      column: seat.column,
      sectionId: seat.sectionId,
      sectionName: seat.sectionName,
      seatType: seat.seatType,
      price: sectionPrice, // Pricing injected dynamically per show!
      status: seat.status,
      isWheelchair: seat.wheelchairFlag,
      isRecliner: seat.reclinerFlag,
      dynamicPricingMultiplier: 1.0,
    };
  });
}
