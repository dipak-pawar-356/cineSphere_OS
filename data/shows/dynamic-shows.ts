import { Show } from "@/types";
import { generateShowSeatInventory } from "@/lib/engine/seat-generator";
import {
  LAYOUT_100_SEATS,
  LAYOUT_240_SEATS,
  LAYOUT_68_SEATS,
} from "../halls/reusable-layouts";

// =========================================================================
// THEATRE A (Pune) - Hall 1: 100 Seats (Section A: 20, Section B: 30, Section C: 50)
// =========================================================================

/**
 * 1. Morning Show (10:30 AM) - Pushpa 2: The Rule
 * Section A = ₹200
 * Section B = ₹300
 * Section C = ₹250
 */
const SHOW_PUN_001_PRICING = {
  sectionPricing: {
    "sec-pun-a": 200,
    "Section A": 200,
    "sec-pun-b": 300,
    "Section B": 300,
    "sec-pun-c": 250,
    "Section C": 250,
  },
  defaultPrice: 200,
  slotType: "Morning" as const,
  dayType: "Weekday" as const,
};

const SHOW_PUN_001_INVENTORY = generateShowSeatInventory(
  LAYOUT_100_SEATS,
  { id: "show-pun-001", pricing: SHOW_PUN_001_PRICING },
  {
    bookedSeats: ["A1", "A2", "A3", "B5", "B6", "C10", "C11", "C12"],
    reservedSeats: ["B1", "B2"],
    wheelchairSeats: ["C1"],
  }
);

export const SHOW_PUN_MORNING: Show = {
  id: "show-pun-001",
  movieId: "mov-005",
  movieTitle: "Pushpa 2: The Rule",
  theatreId: "th-pun-001",
  theatreName: "CineSphere Grand Cinemas",
  hallId: "hall-1",
  hallName: "Hall 1 - IMAX with Laser",
  showDate: "Today",
  startTime: "10:30 AM",
  endTime: "01:30 PM",
  language: "Telugu",
  format: "IMAX 3D",
  pricing: SHOW_PUN_001_PRICING,
  seatInventory: SHOW_PUN_001_INVENTORY,
  ticketPrice: 200, // Starts from ₹200
  seatsBooked: 8,
  totalSeats: 100,
  status: "Upcoming",
};

/**
 * 2. Night Show (09:45 PM) - Kalki 2898 AD
 * Section A = ₹250
 * Section B = ₹350
 * Section C = ₹300
 */
const SHOW_PUN_002_PRICING = {
  sectionPricing: {
    "sec-pun-a": 250,
    "Section A": 250,
    "sec-pun-b": 350,
    "Section B": 350,
    "sec-pun-c": 300,
    "Section C": 300,
  },
  defaultPrice: 250,
  slotType: "Night" as const,
  dayType: "Weekend" as const,
};

const SHOW_PUN_002_INVENTORY = generateShowSeatInventory(
  LAYOUT_100_SEATS,
  { id: "show-pun-002", pricing: SHOW_PUN_002_PRICING },
  {
    bookedSeats: [
      "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8",
      "B10", "B11", "B12", "B13", "B14", "B15",
      "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"
    ],
    reservedSeats: ["B1", "B2"],
    wheelchairSeats: ["C25"],
  }
);

export const SHOW_PUN_NIGHT: Show = {
  id: "show-pun-002",
  movieId: "mov-004",
  movieTitle: "Kalki 2898 AD",
  theatreId: "th-pun-001",
  theatreName: "CineSphere Grand Cinemas",
  hallId: "hall-1",
  hallName: "Hall 1 - IMAX with Laser",
  showDate: "Today",
  startTime: "09:45 PM",
  endTime: "12:45 AM",
  language: "Hindi",
  format: "IMAX 3D",
  pricing: SHOW_PUN_002_PRICING,
  seatInventory: SHOW_PUN_002_INVENTORY,
  ticketPrice: 250, // Starts from ₹250
  seatsBooked: 24,
  totalSeats: 100,
  status: "Upcoming",
};

// =========================================================================
// THEATRE B (Mumbai) - Hall 1: 240 Seats (Royal: 40, Platinum: 100, Gold: 100)
// =========================================================================

const SHOW_MUM_001_PRICING = {
  sectionPricing: {
    "sec-mum-royal": 1200,
    "Royal Suite": 1200,
    "sec-mum-platinum": 750,
    "Platinum Recliners": 750,
    "sec-mum-gold": 450,
    "Gold Prime": 450,
  },
  defaultPrice: 450,
  slotType: "Evening" as const,
  dayType: "Weekend" as const,
};

const SHOW_MUM_001_INVENTORY = generateShowSeatInventory(
  LAYOUT_240_SEATS,
  { id: "show-mum-001", pricing: SHOW_MUM_001_PRICING },
  {
    bookedSeats: ["A1", "A2", "B1", "B2", "C5", "C6", "G10", "G11", "G12"],
    reservedSeats: ["A5", "A6"],
    wheelchairSeats: ["G1", "G25"],
  }
);

export const SHOW_MUMBAI_PRIME: Show = {
  id: "show-mum-001",
  movieId: "mov-001",
  movieTitle: "Dune: Part Two",
  theatreId: "th-mum-001",
  theatreName: "CineSphere Royale Palladium",
  hallId: "hall-mum-1",
  hallName: "Auditorium 1 - Royale IMAX & Dolby",
  showDate: "Today",
  startTime: "06:30 PM",
  endTime: "09:15 PM",
  language: "English",
  format: "Dolby Cinema",
  pricing: SHOW_MUM_001_PRICING,
  seatInventory: SHOW_MUM_001_INVENTORY,
  ticketPrice: 450,
  seatsBooked: 9,
  totalSeats: 240,
  status: "Running",
};

// =========================================================================
// THEATRE C (Ahmedabad) - Hall 1: 68 Seats (Recliners: 28, Prime: 40)
// =========================================================================

const SHOW_AHD_001_PRICING = {
  sectionPricing: {
    "sec-ahd-recliner": 450,
    "Zero-G Recliners": 450,
    "sec-ahd-prime": 280,
    "Prime Club": 280,
  },
  defaultPrice: 280,
  slotType: "Matinee" as const,
  dayType: "Weekday" as const,
};

const SHOW_AHD_001_INVENTORY = generateShowSeatInventory(
  LAYOUT_68_SEATS,
  { id: "show-ahd-001", pricing: SHOW_AHD_001_PRICING },
  {
    bookedSeats: ["A1", "A2", "A3", "C10", "C11"],
    wheelchairSeats: ["C1"],
  }
);

export const SHOW_AHMEDABAD_MATINEE: Show = {
  id: "show-ahd-001",
  movieId: "mov-006",
  movieTitle: "Stree 2: Sarkate Ka Aatank",
  theatreId: "th-ahd-001",
  theatreName: "CineSphere Heritage Ahmedabad",
  hallId: "hall-ahd-1",
  hallName: "Audi 1 - Boutique Heritage Lounge",
  showDate: "Today",
  startTime: "04:30 PM",
  endTime: "07:00 PM",
  language: "Hindi",
  format: "Laser 4K",
  pricing: SHOW_AHD_001_PRICING,
  seatInventory: SHOW_AHD_001_INVENTORY,
  ticketPrice: 280,
  seatsBooked: 5,
  totalSeats: 68,
  status: "Completed",
};

export const DYNAMIC_SHOWS: Show[] = [
  SHOW_PUN_MORNING,
  SHOW_PUN_NIGHT,
  SHOW_MUMBAI_PRIME,
  SHOW_AHMEDABAD_MATINEE,
];

