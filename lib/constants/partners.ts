export interface Partner {
  id: string;
  name: string;
  category: string;
  tagline: string;
  logoText: string;
}

export const DUMMY_PARTNERS: Partner[] = [
  { id: "part-1", name: "IMAX Corporation", category: "Projection & Sound", tagline: "Filmed for IMAX Laser Certification", logoText: "IMAX" },
  { id: "part-2", name: "Dolby Laboratories", category: "Immersive Audio", tagline: "Dolby Atmos 128-Channel Processing", logoText: "DOLBY" },
  { id: "part-3", name: "Christie Digital", category: "Cinema Projection", tagline: "4K Pure Laser Projectors", logoText: "CHRISTIE" },
  { id: "part-4", name: "Barco Cinema", category: "Exhibition Hardware", tagline: "Laser Light Source Systems", logoText: "BARCO" },
  { id: "part-5", name: "QSC Audio", category: "Acoustic Engineering", tagline: "Cinema Amplifiers & Digital Signal Processors", logoText: "QSC" },
  { id: "part-6", name: "Warner Bros. Discovery", category: "Studio Partner", tagline: "Direct DCP Pipeline Integration", logoText: "WARNER BROS" },
  { id: "part-7", name: "Universal Pictures", category: "Studio Partner", tagline: "Global Premiere Ingestion", logoText: "UNIVERSAL" },
  { id: "part-8", name: "Sony Pictures Entertainment", category: "Studio Partner", tagline: "4K Master Distribution", logoText: "SONY PICTURES" },
  { id: "part-9", name: "Apple Wallet & Pay", category: "Digital Passes", tagline: "Dynamic NFC Turnstile Verification", logoText: "APPLE PAY" },
  { id: "part-10", name: "Comscore Movies", category: "Box Office EDI", tagline: "Certified Rentrak Reporting Endpoint", logoText: "COMSCORE" },
];

