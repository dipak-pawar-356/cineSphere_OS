import { TheatreAmenity, TheatreFacility } from "@/types";

export const MOCK_AMENITIES: { name: TheatreAmenity; category: "audio" | "projection" | "comfort" | "convenience" }[] = [
  { name: "Barco 4K Laser Projection", category: "projection" },
  { name: "Dolby Atmos 64-Channel Spatial Audio", category: "audio" },
  { name: "IMAX with Laser", category: "projection" },
  { name: "4DX Dynamic Motion & Environmental FX", category: "comfort" },
  { name: "Zero-Gravity Ultra Recliners", category: "comfort" },
  { name: "Gourmet In-Seat Butler Dining", category: "convenience" },
  { name: "Fast Electric Vehicle (EV) Charging Stations", category: "convenience" },
  { name: "Dedicated Valet Drop-off & Retrieval", category: "convenience" },
  { name: "Accessible Ramps & Companion Wheelchair Seating", category: "comfort" },
  { name: "High-Speed Wi-Fi & Lounge Bar", category: "convenience" },
  { name: "Dolby Cinema", category: "projection" },
  { name: "ScreenX 270-Degree Panorama", category: "projection" },
];

export const MOCK_FACILITIES: TheatreFacility[] = [
  "Multi-Cuisine Gourmet Concessions Lounge",
  "Kids Play Zone & Arcade Alcove",
  "Executive Boardroom for Corporate Screenings",
  "Baby Care Station & Private Feeding Suite",
  "Luggage Cloakroom & Powerbank Dispenser",
  "Automated QR Ticket Gates with Facial Check-In",
  "ATM & Cash Dispenser",
  "Prayer Room",
];
