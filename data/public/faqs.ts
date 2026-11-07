import { FAQItem } from "@/types";

export const MOCK_FAQS: FAQItem[] = [
  // Platform
  {
    id: "faq-001",
    question: "What is CineSphere OS?",
    answer:
      "CineSphere OS is an enterprise-grade Cinema Management Platform and Operating System built to unite theater operations, multi-format ticketing, real-time concession dispatch, and cinematic discovery into one seamless ecosystem.",
    category: "Platform",
  },
  {
    id: "faq-002",
    question: "How does CineSphere OS differ from conventional movie booking apps?",
    answer:
      "Conventional apps merely aggregate ticket sales. CineSphere OS connects the entire cinema pipeline: from direct distributor key ingestion (KDM), 64-channel spatial sound tuning, and smart HVAC control to in-seat dining and turnstile QR gate control.",
    category: "Platform",
  },
  {
    id: "faq-003",
    question: "Is CineSphere OS available across mobile and desktop devices?",
    answer:
      "Yes. CineSphere OS is built with responsive architecture engineered to adapt seamlessly across smartphones, tablets, widescreen desktops, and in-theatre kiosk touch displays.",
    category: "Platform",
  },

  // Movies
  {
    id: "faq-004",
    question: "Which projection and sound formats do CineSphere auditoriums support?",
    answer:
      "Our partner auditoriums support IMAX with Laser, Dolby Cinema with Dolby Atmos, ScreenX 270-degree panorama, 4DX dynamic motion seating, RealD 3D, and Barco 4K laser projection.",
    category: "Movies",
  },
  {
    id: "faq-005",
    question: "When are advance bookings opened for major blockbuster releases?",
    answer:
      "Advance bookings typically go live 3 to 7 days before theatrical premiere date. VIP Club members receive priority notifications and early reservation windows 24 to 48 hours prior to public release.",
    category: "Movies",
  },
  {
    id: "faq-006",
    question: "Can I watch films in multiple audio languages and with subtitles?",
    answer:
      "Yes. Show listings clearly label audio tracks (Hindi, English, Tamil, Telugu, Malayalam, Japanese, etc.) and indicate subtitle availability (Eng CC) directly on showtime chips.",
    category: "Movies",
  },

  // Booking
  {
    id: "faq-007",
    question: "How do I book tickets on CineSphere?",
    answer:
      "Select your preferred city, movie, cinema, and showtime. Pick your preferred seats from our interactive hall map, optionally add gourmet F&B combos, and complete payment via UPI, Credit Card, or Net Banking.",
    category: "Booking",
  },
  {
    id: "faq-008",
    question: "How do I access the theatre on the day of the show?",
    answer:
      "Upon successful booking, an encrypted digital m-ticket with a dynamic QR code is generated. Present this QR code at our automated turnstile gate or to the foyer usher for instant contactless verification.",
    category: "Booking",
  },
  {
    id: "faq-009",
    question: "What is the maximum number of tickets I can book in a single transaction?",
    answer:
      "You can book up to 10 seats in a single regular transaction. For corporate screenings, bulk celebrations, or full hall reservations, please contact our Guest Relations concierge.",
    category: "Booking",
  },

  // Theatres
  {
    id: "faq-010",
    question: "Where can I find the amenities available at a specific cinema?",
    answer:
      "Each cinema detail page features a comprehensive overview of hall specifications, projection hardware, audio calibration, parking/valet availability, EV charging stations, and accessible seating ramps.",
    category: "Theatres",
  },
  {
    id: "faq-011",
    question: "Are CineSphere partner theatres wheelchair accessible?",
    answer:
      "Yes. All CineSphere flagship cinemas feature step-free ramp access, dedicated elevators, and reserved companion seating areas in the prime viewing tier.",
    category: "Theatres",
  },
  {
    id: "faq-012",
    question: "Is outside food and beverage permitted inside the halls?",
    answer:
      "In accordance with standard multiplex regulations and municipal health bylaws, outside food and beverage items are not permitted. We offer a comprehensive gourmet menu curated by culinary chefs.",
    category: "Theatres",
  },

  // Refund
  {
    id: "faq-013",
    question: "Can I cancel my movie ticket booking?",
    answer:
      "Yes, tickets can be cancelled up to 2 hours before the scheduled showtime directly through your booking history dashboard.",
    category: "Refund",
  },
  {
    id: "faq-014",
    question: "How long does it take for a refund to reflect in my account?",
    answer:
      "Refunds processed to UPI handles are credited within 2 to 4 hours. Credit card, debit card, and net banking refunds are settled back to the source account within 3 to 5 business days.",
    category: "Refund",
  },
  {
    id: "faq-015",
    question: "Are convenience fees refundable upon cancellation?",
    answer:
      "Convenience fees and government taxes are non-refundable third-party processing charges. However, 100% of the ticket base price and pre-booked concessions are refunded.",
    category: "Refund",
  },

  // Support
  {
    id: "faq-016",
    question: "How do I reach CineSphere Guest Support?",
    answer:
      "You can reach our 24/7 Guest Care desk via live in-app chat, email at support@cinesphere.os, or toll-free helpline at 1800-419-CINE (2463).",
    category: "Support",
  },
  {
    id: "faq-017",
    question: "What should I do if my payment was debited but the booking failed?",
    answer:
      "Our automated reconciliation engine detects pending bank debits every 5 minutes. If no ticket was issued, the funds are automatically reversed to your source account within 24 hours.",
    category: "Support",
  },

  // Membership
  {
    id: "faq-018",
    question: "What are the perks of the CineSphere VIP Club?",
    answer:
      "VIP Club members enjoy 20% savings on all ticket bookings, complimentary valet service, dedicated skip-the-line check-in lanes, free popcorn on birthdays, and priority booking windows.",
    category: "Membership",
  },
  {
    id: "faq-019",
    question: "How do I earn CineSphere Reward Coins?",
    answer:
      "You earn 10 CineSphere Coins for every ₹100 spent on tickets and gourmet concessions. Coins never expire as long as your account remains active and can be redeemed at checkout.",
    category: "Membership",
  },
  {
    id: "faq-020",
    question: "Can I transfer my CineSphere VIP tier to a family member?",
    answer:
      "VIP memberships are tied to a primary mobile number and email. However, you can add up to 3 family members to your Family Circle to share ticket discounts and reward points.",
    category: "Membership",
  },
];
