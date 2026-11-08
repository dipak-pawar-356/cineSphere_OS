import { HallLayout, HallSection } from "@/types";
import { generateHallLayout } from "@/lib/engine/seat-generator";

/**
 * 1. 100-SEAT REUSABLE LAYOUT (Theatre A / Hall 1: IMAX with Laser)
 * Section A: 20 Seats (Row A) - Blue / Standard
 * Section B: 30 Seats (Row B) - Gold / VIP
 * Section C: 50 Seats (Rows C, D - 25 seats each) - Green / Platinum
 * Total: 20 + 30 + 50 = 100 seats
 */
export const SECTION_A_100: HallSection = {
  id: "sec-pun-a",
  name: "Section A",
  category: "Silver",
  seatCount: 20,
  seatType: "Standard",
  defaultColor: "#3B82F6", // Blue
  displayOrder: 1,
  rows: ["A"],
  seatsPerRow: 20,
  priority: 3,
};

export const SECTION_B_100: HallSection = {
  id: "sec-pun-b",
  name: "Section B",
  category: "Gold",
  seatCount: 30,
  seatType: "VIP",
  defaultColor: "#F59E0B", // Gold / Amber
  displayOrder: 2,
  rows: ["B"],
  seatsPerRow: 30,
  priority: 2,
  isVIP: true,
};

export const SECTION_C_100: HallSection = {
  id: "sec-pun-c",
  name: "Section C",
  category: "Platinum",
  seatCount: 50,
  seatType: "Recliner",
  defaultColor: "#10B981", // Green
  displayOrder: 3,
  rows: ["C", "D"],
  seatsPerRow: 25,
  priority: 1,
  hasRecliners: true,
  hasWheelchairSpaces: true,
};

export const LAYOUT_100_SEATS: HallLayout = generateHallLayout({
  hallId: "hall-1",
  theatreId: "th-pun-001",
  name: "Hall 1 - 100 Seats Tri-Tier Layout",
  sections: [SECTION_A_100, SECTION_B_100, SECTION_C_100],
  walkways: [{ afterColumn: 15, label: "Center Aisle" }],
  vipAreas: ["Section B"],
  wheelchairSpaces: ["C1", "C25"],
});

/**
 * 2. 240-SEAT REUSABLE LAYOUT (Theatre B: CineSphere Royale Palladium, Mumbai)
 * Section Royal: 40 Seats (Rows A, B - 20 seats each) - Champagne / Royal Loungers
 * Section Platinum: 100 Seats (Rows C, D, E, F - 25 seats each) - Purple / Motorized Recliners
 * Section Gold: 100 Seats (Rows G, H, J, K - 25 seats each) - Amber / Club Seating
 * Total: 40 + 100 + 100 = 240 seats
 */
export const SECTION_ROYAL_240: HallSection = {
  id: "sec-mum-royal",
  name: "Royal Suite",
  category: "Royal Suite Lounger",
  seatCount: 40,
  seatType: "Couple",
  defaultColor: "#EAB308",
  displayOrder: 1,
  rows: ["A", "B"],
  seatsPerRow: 20,
  priority: 1,
  isVIP: true,
  hasRecliners: true,
};

export const SECTION_PLATINUM_240: HallSection = {
  id: "sec-mum-platinum",
  name: "Platinum Recliners",
  category: "Platinum",
  seatCount: 100,
  seatType: "Recliner",
  defaultColor: "#A855F7",
  displayOrder: 2,
  rows: ["C", "D", "E", "F"],
  seatsPerRow: 25,
  priority: 2,
  hasRecliners: true,
};

export const SECTION_GOLD_240: HallSection = {
  id: "sec-mum-gold",
  name: "Gold Prime",
  category: "Gold",
  seatCount: 100,
  seatType: "Standard",
  defaultColor: "#38BDF8",
  displayOrder: 3,
  rows: ["G", "H", "J", "K"],
  seatsPerRow: 25,
  priority: 3,
  hasWheelchairSpaces: true,
};

export const LAYOUT_240_SEATS: HallLayout = generateHallLayout({
  hallId: "hall-mum-1",
  theatreId: "th-mum-001",
  name: "Royale 240 Grand Pavilion",
  sections: [SECTION_ROYAL_240, SECTION_PLATINUM_240, SECTION_GOLD_240],
  walkways: [
    { afterColumn: 12, label: "Left Promenade" },
    { afterColumn: 13, label: "Right Promenade" },
  ],
  vipAreas: ["Royal Suite"],
  wheelchairSpaces: ["G1", "G25", "H1", "H25"],
});

/**
 * 3. 68-SEAT BOUTIQUE REUSABLE LAYOUT (Theatre C: CineSphere Heritage Ahmedabad)
 * Section Recliner: 28 Seats (Rows A, B - 14 seats each) - Rose / Zero-G
 * Section Prime: 40 Seats (Rows C, D - 20 seats each) - Teal / Premium Club
 * Total: 28 + 40 = 68 seats
 */
export const SECTION_RECLINER_68: HallSection = {
  id: "sec-ahd-recliner",
  name: "Zero-G Recliners",
  category: "VIP Recliner",
  seatCount: 28,
  seatType: "Recliner",
  defaultColor: "#F43F5E",
  displayOrder: 1,
  rows: ["A", "B"],
  seatsPerRow: 14,
  priority: 1,
  hasRecliners: true,
};

export const SECTION_PRIME_68: HallSection = {
  id: "sec-ahd-prime",
  name: "Prime Club",
  category: "Gold",
  seatCount: 40,
  seatType: "Standard",
  defaultColor: "#14B8A6",
  displayOrder: 2,
  rows: ["C", "D"],
  seatsPerRow: 20,
  priority: 2,
  hasWheelchairSpaces: true,
};

export const LAYOUT_68_SEATS: HallLayout = generateHallLayout({
  hallId: "hall-ahd-1",
  theatreId: "th-ahd-001",
  name: "Boutique Heritage 68 Lounge",
  sections: [SECTION_RECLINER_68, SECTION_PRIME_68],
  walkways: [{ afterColumn: 10, label: "Center Aisle" }],
  vipAreas: ["Zero-G Recliners"],
  wheelchairSpaces: ["C1", "C20"],
});

