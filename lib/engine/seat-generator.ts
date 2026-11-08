import {
  HallSection,
  HallLayout,
  Seat,
  SeatStatus,
  SeatType,
  Show,
  ShowPricing,
  ShowSeat,
  PricingSummary,
  WalkwayConfig,
  EmergencyExitConfig,
} from "@/types";

/**
 * Automatically generates seats for a section.
 * Theatre Admin NEVER manually creates individual seats.
 * Given Section A (20 seats), Section B (30 seats), Section C (50 seats),
 * this automatically generates A1..A20, B1..B30, C1..C50 with coordinates,
 * seat numbers, display labels, and categories.
 */
export function generateSeatsForSection(section: HallSection): Seat[] {
  const seats: Seat[] = [];
  const rows = section.rows && section.rows.length > 0
    ? section.rows
    : [section.name.replace(/[^A-Za-z]/g, "").slice(0, 1) || "A"];

  const seatsPerRow = section.seatsPerRow > 0
    ? section.seatsPerRow
    : Math.ceil(section.seatCount / rows.length);

  let currentSeatNumber = 1;

  for (let rIndex = 0; rIndex < rows.length; rIndex++) {
    const rowLabel = rows[rIndex];
    for (let c = 1; c <= seatsPerRow; c++) {
      if (seats.length >= section.seatCount) break;

      const seatNumber = `${rowLabel}${c}`;
      seats.push({
        id: `${section.id}-${seatNumber}`,
        seatNumber,
        row: rowLabel,
        column: c,
        sectionId: section.id,
        sectionName: section.name,
        seatType: section.seatType || "Standard",
        status: "Available",
        coordinates: {
          x: c * 40,
          y: (rIndex + 1) * 44,
        },
      });

      currentSeatNumber++;
    }
  }

  return seats;
}

export interface CreateHallLayoutInput {
  hallId: string;
  theatreId: string;
  name: string;
  sections: HallSection[];
  walkways?: WalkwayConfig[];
  emergencyExits?: EmergencyExitConfig[];
  vipAreas?: string[];
  wheelchairSpaces?: string[];
}

/**
 * Generates a reusable Hall Layout.
 * Designed once by Theatre Admin, reused across unlimited future Shows.
 * Recalculates capacity and regenerates seat matrix dynamically.
 */
export function generateHallLayout(input: CreateHallLayoutInput): HallLayout {
  const populatedSections: HallSection[] = input.sections.map((sec, index) => {
    const generatedSeats = generateSeatsForSection(sec);
    return {
      ...sec,
      displayOrder: sec.displayOrder ?? index + 1,
      generatedSeats,
    };
  });

  const allSeats: Seat[] = populatedSections.flatMap((s) => s.generatedSeats || []);
  const totalCapacity = populatedSections.reduce((acc, s) => acc + s.seatCount, 0);

  const uniqueRows = Array.from(new Set(allSeats.map((s) => s.row)));
  const maxCols = Math.max(...allSeats.map((s) => s.column), 1);

  return {
    id: `layout-${input.hallId}`,
    hallId: input.hallId,
    theatreId: input.theatreId,
    name: input.name,
    capacity: totalCapacity,
    sections: populatedSections,
    rows: uniqueRows.length,
    maxColumns: maxCols,
    walkways: input.walkways || [
      { afterColumn: Math.floor(maxCols / 2), label: "Center Aisle" },
    ],
    vipAreas: input.vipAreas || [],
    wheelchairSpaces: input.wheelchairSpaces || [],
    emergencyExits: input.emergencyExits || [
      { position: "front-left", label: "Exit 1" },
      { position: "front-right", label: "Exit 2" },
      { position: "rear-right", label: "Exit 3" },
    ],
    future3DConfig: {
      cameraFov: 60,
      screenCurvature: 0.15,
      screenTiltDegrees: 4,
      eyeLevelOffsetMeters: 1.2,
    },
    generatedSeats: allSeats,
  };
}

export interface GenerateInventoryOptions {
  bookedSeats?: string[];
  reservedSeats?: string[];
  blockedSeats?: string[];
  maintenanceSeats?: string[];
  wheelchairSeats?: string[];
  dynamicMultiplier?: number;
}

/**
 * Dynamic Show Seat Inventory Engine
 * Crucial Rule: Combines reusable HallLayout + Show + Section Pricing!
 * The seat price is inherited strictly from the Show's pricing for that section.
 */
export function generateShowSeatInventory(
  hallLayout: HallLayout,
  show: { id: string; pricing: ShowPricing },
  options: GenerateInventoryOptions = {}
): ShowSeat[] {
  const bookedSet = new Set(options.bookedSeats || []);
  const reservedSet = new Set(options.reservedSeats || []);
  const blockedSet = new Set(options.blockedSeats || []);
  const maintenanceSet = new Set(options.maintenanceSeats || []);
  const wheelchairSet = new Set(options.wheelchairSeats || []);

  const sectionPriceMap = show.pricing?.sectionPricing || {};
  const defaultPrice = show.pricing?.defaultPrice || 250;
  const multiplier = options.dynamicMultiplier || 1.0;

  return hallLayout.generatedSeats.map((seat) => {
    // Determine section price
    const basePrice =
      sectionPriceMap[seat.sectionId] ??
      sectionPriceMap[seat.sectionName] ??
      defaultPrice;

    const finalPrice = Math.round(basePrice * multiplier);

    // Determine show-specific status
    let status: SeatStatus = "Available";
    if (bookedSet.has(seat.seatNumber)) {
      status = "Booked";
    } else if (reservedSet.has(seat.seatNumber)) {
      status = "Reserved";
    } else if (blockedSet.has(seat.seatNumber)) {
      status = "Blocked";
    } else if (maintenanceSet.has(seat.seatNumber)) {
      status = "Maintenance";
    } else if (wheelchairSet.has(seat.seatNumber) || seat.seatType === "Wheelchair") {
      status = "Wheelchair";
    }

    return {
      id: `${show.id}-${seat.seatNumber}`,
      showId: show.id,
      seatNumber: seat.seatNumber,
      row: seat.row,
      column: seat.column,
      sectionId: seat.sectionId,
      sectionName: seat.sectionName,
      seatType: seat.seatType,
      price: finalPrice,
      status,
      isWheelchair: seat.seatType === "Wheelchair" || wheelchairSet.has(seat.seatNumber),
      isRecliner: seat.seatType === "Recliner",
      dynamicPricingMultiplier: multiplier,
    };
  });
}

/**
 * Live Price Calculation Utility
 * Automatically recalculates subtotal, convenience fee, taxes, and grand total in real-time.
 */
export function calculateBookingPrice(
  selectedSeats: ShowSeat[],
  options: {
    convenienceFeePerSeat?: number;
    gstPercent?: number;
  } = {}
): PricingSummary {
  const convenienceFeePerSeat = options.convenienceFeePerSeat ?? 35;
  const gstPercent = options.gstPercent ?? 18;

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length * convenienceFeePerSeat;
  const taxableAmount = subtotal + convenienceFee;
  const tax = Math.round((taxableAmount * gstPercent) / 100);
  const total = subtotal + convenienceFee + tax;

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return {
    subtotal,
    convenienceFee,
    tax,
    total,
    formattedSubtotal: formatINR(subtotal),
    formattedConvenienceFee: formatINR(convenienceFee),
    formattedTax: formatINR(tax),
    formattedTotal: formatINR(total),
    seatCount: selectedSeats.length,
  };
}

