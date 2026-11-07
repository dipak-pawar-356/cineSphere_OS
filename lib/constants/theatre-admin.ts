/**
 * CineSphere OS — Theatre Admin Dummy Data & Multi-Tenant Fixtures
 * Tenant: CineSphere Grand Cinemas (Phoenix Marketcity, Pune)
 */

export interface TheatreProfile {
  id: string;
  name: string;
  code: string;
  tagline: string;
  city: string;
  state: string;
  address: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  established: number;
  totalScreens: number;
  totalHalls: number;
  totalSeats: number;
  status: "Active" | "Maintenance" | "Renovating";
  openingTime: string;
  closingTime: string;
  heroImage: string;
  bannerImage: string;
  amenities: string[];
  facilities: string[];
  gallery: { id: string; title: string; category: string; url: string }[];
}

export interface TheatreHall {
  id: string;
  hallNumber: number;
  name: string;
  screenType: "IMAX Laser" | "Dolby Cinema" | "4DX Dynamic" | "Prime Club" | "Royal Suite";
  seatCount: number;
  currentMovie: string;
  currentShow: string;
  occupancyPercent: number;
  audioSpec: string;
  projectorModel: string;
  aspectRatio: string;
  status: "Active" | "Maintenance" | "Cleaning" | "Show Running";
  image: string;
}

export interface TheatreMovie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  language: string;
  genre: string[];
  rating: string;
  runtime: string;
  releaseDate: string;
  status: "Now Showing" | "Upcoming" | "Special Screening";
  formats: ("2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos")[];
  director: string;
  leadCast: string[];
  synopsis: string;
}

export interface TheatreShow {
  id: string;
  movieId: string;
  movieTitle: string;
  hallId: string;
  hallName: string;
  date: string;
  startTime: string;
  endTime: string;
  language: string;
  format: "2D" | "3D" | "IMAX" | "4DX" | "Dolby Atmos";
  ticketPrice: number;
  seatsBooked: number;
  totalSeats: number;
  status: "Upcoming" | "Running" | "Housefull" | "Completed" | "Cancelled";
}

export interface TheatreBooking {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieTitle: string;
  hallName: string;
  showTime: string;
  bookingDate: string;
  seats: string[];
  amount: number;
  paymentMethod: "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Cash" | "Wallet";
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Failed";
  bookingStatus: "Confirmed" | "Completed" | "Cancelled" | "Checked-in";
}

export interface TheatreCustomer {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  loyaltyTier: "Standard" | "Silver" | "Gold" | "Platinum" | "CineSphere VIP";
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  registrationDate: string;
  status: "Active" | "Dormant" | "VIP";
  preferredGenre: string;
}

export interface TheatreStaff {
  id: string;
  employeeCode: string;
  name: string;
  avatar: string;
  designation: string;
  role: "Theatre Admin" | "Hall Manager" | "Ticket Counter Staff" | "Floor Staff" | "Food Court Staff" | "Projectionist" | "Support Staff";
  assignedHall: string;
  email: string;
  phone: string;
  joiningDate: string;
  shift: "Morning (08:00 - 16:30)" | "Evening (16:00 - 00:30)" | "Night Shift";
  status: "On Duty" | "Off Duty" | "On Leave";
}

export interface TheatreOffer {
  id: string;
  title: string;
  code: string;
  category: "Festival Offers" | "Cashback" | "Food Combos" | "Membership" | "Student Discounts";
  discount: string;
  description: string;
  validUntil: string;
  status: "Active" | "Upcoming" | "Expired";
  usageCount: number;
}

export interface TheatreEvent {
  id: string;
  title: string;
  category: "Concerts" | "Stand-up Comedy" | "Live Sports" | "Film Festivals" | "Theatre";
  date: string;
  time: string;
  hallName: string;
  price: number;
  image: string;
  status: "Tickets Open" | "Almost Full" | "Completed";
  artist: string;
}

export interface TheatreTransaction {
  id: string;
  bookingRef: string;
  customer: string;
  amount: number;
  paymentMethod: "UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Cash";
  timestamp: string;
  status: "Success" | "Pending" | "Refunded" | "Failed";
  gatewayRef: string;
}

export interface TheatreNotification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "theatre" | "movie" | "show" | "staff" | "alert";
  state: "unread" | "read";
  time: string;
  severity: "info" | "success" | "warning" | "danger";
}

export interface TheatreSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: "Laser Projector" | "Dolby Sound Rack" | "HVAC System" | "POS Terminal" | "Seat Hardware" | "General";
  priority: "High" | "Urgent" | "Medium" | "Low";
  createdDate: string;
  assignedEngineer: string;
  status: "Open" | "In Progress" | "Resolved" | "Escalated";
}

export interface TheatreReport {
  id: string;
  title: string;
  category: "Daily Box Office" | "Occupancy" | "Concessions" | "Distributor Split" | "Tax Compliance";
  lastGenerated: string;
  period: string;
  fileSize: string;
  status: "Ready" | "Processing" | "Archived";
}

// ==========================================
// CENTRALIZED TENANT DATA
// ==========================================

export const CURRENT_THEATRE: TheatreProfile = {
  id: "th-pun-001",
  name: "CineSphere Grand Cinemas",
  code: "CS-PUN-042",
  tagline: "Pune's Flagship Laser Multiplex & Royal Dining Lounge",
  city: "Pune",
  state: "Maharashtra",
  address: "Level 4, Phoenix Marketcity, Viman Nagar",
  pinCode: "411014",
  phone: "+91 20 6689 0042",
  email: "gm.pune@cinesphere.io",
  website: "https://cinesphere.io/theatres/pune-grand",
  established: 2021,
  totalScreens: 5,
  totalHalls: 5,
  totalSeats: 850,
  status: "Active",
  openingTime: "08:30 AM",
  closingTime: "01:30 AM",
  heroImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80",
  bannerImage: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80",
  amenities: [
    "Barco 4K Laser Projection",
    "Dolby Atmos 64-Channel Spatial Audio",
    "IMAX with Laser (Screen 02)",
    "4DX Dynamic Motion & Environmental FX",
    "Zero-Gravity Ultra Recliners",
    "Gourmet In-Seat Butler Dining",
    "Fast Electric Vehicle (EV) Charging Stations",
    "Dedicated Valet Drop-off & Retrieval",
    "Accessible Ramps & Companion Wheelchair Seating",
    "High-Speed Wi-Fi & Lounge Bar",
  ],
  facilities: [
    "Multi-Cuisine Gourmet Concessions Lounge",
    "Kids Play Zone & Arcade Alcove",
    "Executive Boardroom for Corporate Screenings",
    "Baby Care Station & Private Feeding Suite",
    "Luggage Cloakroom & Powerbank Dispenser",
    "Automated QR Ticket Gates with Facial Check-In",
  ],
  gallery: [
    {
      id: "g1",
      title: "IMAX Laser Auditorium",
      category: "Auditoriums",
      url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "g2",
      title: "Royal Suite Luxury Lounge",
      category: "Lounge & VIP",
      url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "g3",
      title: "Gourmet Live Kitchen",
      category: "Concessions",
      url: "https://images.unsplash.com/photo-1586899028174-e7098604235b?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "g4",
      title: "Dolby Atmos Acoustic Wall Treatment",
      category: "Auditoriums",
      url: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80",
    },
  ],
};

export const THEATRE_HALLS: TheatreHall[] = [
  {
    id: "hall-01",
    hallNumber: 1,
    name: "Screen 01 — Dolby Cinema",
    screenType: "Dolby Cinema",
    seatCount: 220,
    currentMovie: "Dune: Part Two",
    currentShow: "07:30 PM",
    occupancyPercent: 92,
    audioSpec: "Dolby Atmos 64-ch Array (128dB headroom)",
    projectorModel: "Christie CP4450-RGB Pure Laser 45,000 Lumens",
    aspectRatio: "2.39:1 Scope",
    status: "Active",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "hall-02",
    hallNumber: 2,
    name: "Screen 02 — IMAX with Laser",
    screenType: "IMAX Laser",
    seatCount: 260,
    currentMovie: "Oppenheimer (Special 70mm Format)",
    currentShow: "08:15 PM",
    occupancyPercent: 98,
    audioSpec: "IMAX 12-Channel Immersive Sound Array",
    projectorModel: "Dual 4K Commercial Laser Projection System",
    aspectRatio: "1.43:1 Full IMAX Ratio",
    status: "Active",
    image: "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "hall-03",
    hallNumber: 3,
    name: "Screen 03 — Prime Club",
    screenType: "Prime Club",
    seatCount: 150,
    currentMovie: "Interstellar (10th Anniversary)",
    currentShow: "06:45 PM",
    occupancyPercent: 74,
    audioSpec: "JBL Professional 7.1 Surround Cinema Rig",
    projectorModel: "Barco Series 4 SP4K-25 Laser Projector",
    aspectRatio: "1.85:1 Flat",
    status: "Active",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "hall-04",
    hallNumber: 4,
    name: "Screen 04 — 4DX Dynamic",
    screenType: "4DX Dynamic",
    seatCount: 120,
    currentMovie: "Furiosa: A Mad Max Saga",
    currentShow: "09:00 PM",
    occupancyPercent: 88,
    audioSpec: "Surround Sound with Synchronized Pneumatic Seats",
    projectorModel: "Barco DP4K-32B High-Frame-Rate Laser",
    aspectRatio: "2.39:1 Scope",
    status: "Active",
    image: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "hall-05",
    hallNumber: 5,
    name: "Screen 05 — Royal Suite VIP",
    screenType: "Royal Suite",
    seatCount: 100,
    currentMovie: "Gladiator II",
    currentShow: "08:45 PM",
    occupancyPercent: 95,
    audioSpec: "Meyer Sound Studio Precision Acoustic Rig",
    projectorModel: "Christie CP2308 Laser Series",
    aspectRatio: "2.39:1 Scope",
    status: "Active",
    image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80",
  },
];

export const THEATRE_MOVIES: TheatreMovie[] = [
  {
    id: "mov-01",
    title: "Dune: Part Two",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    language: "English (Dolby Atmos)",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    rating: "UA 16+",
    runtime: "166 mins",
    releaseDate: "2024-03-01",
    status: "Now Showing",
    formats: ["2D", "IMAX", "Dolby Atmos"],
    director: "Denis Villeneuve",
    leadCast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
  },
  {
    id: "mov-02",
    title: "Oppenheimer",
    poster: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    language: "English",
    genre: ["Biography", "Drama", "History"],
    rating: "A",
    runtime: "180 mins",
    releaseDate: "2023-07-21",
    status: "Now Showing",
    formats: ["IMAX", "2D"],
    director: "Christopher Nolan",
    leadCast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
    synopsis: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
  },
  {
    id: "mov-03",
    title: "Interstellar",
    poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=1200&auto=format&fit=crop&q=80",
    language: "English",
    genre: ["Sci-Fi", "Adventure"],
    rating: "UA",
    runtime: "169 mins",
    releaseDate: "2014-11-07",
    status: "Special Screening",
    formats: ["IMAX", "Dolby Atmos"],
    director: "Christopher Nolan",
    leadCast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    synopsis: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft.",
  },
  {
    id: "mov-04",
    title: "Furiosa: A Mad Max Saga",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    language: "English",
    genre: ["Action", "Sci-Fi", "Thriller"],
    rating: "A",
    runtime: "148 mins",
    releaseDate: "2024-05-24",
    status: "Now Showing",
    formats: ["2D", "4DX", "Dolby Atmos"],
    director: "George Miller",
    leadCast: ["Anya Taylor-Joy", "Chris Hemsworth"],
    synopsis: "The origin story of renegade warrior Furiosa before her encounter and teamup with Mad Max.",
  },
  {
    id: "mov-05",
    title: "Gladiator II",
    poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&auto=format&fit=crop&q=80",
    language: "English",
    genre: ["Action", "Adventure", "Drama"],
    rating: "A",
    runtime: "148 mins",
    releaseDate: "2024-11-15",
    status: "Upcoming",
    formats: ["2D", "IMAX", "Dolby Atmos"],
    director: "Ridley Scott",
    leadCast: ["Paul Mescal", "Pedro Pascal", "Denzel Washington"],
    synopsis: "Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum.",
  },
  {
    id: "mov-06",
    title: "Avatar: Fire and Ash",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    language: "English / Hindi",
    genre: ["Sci-Fi", "Fantasy", "Action"],
    rating: "UA 13+",
    runtime: "192 mins",
    releaseDate: "2025-12-19",
    status: "Upcoming",
    formats: ["3D", "IMAX", "4DX", "Dolby Atmos"],
    director: "James Cameron",
    leadCast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
    synopsis: "Jake Sully and Neytiri encounter a hostile volcanic tribe of Na'vi known as the Ash People.",
  },
  {
    id: "mov-07",
    title: "Kalki 2898 AD",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    language: "Telugu / Hindi / Tamil",
    genre: ["Sci-Fi", "Action", "Mythology"],
    rating: "UA",
    runtime: "181 mins",
    releaseDate: "2024-06-27",
    status: "Now Showing",
    formats: ["2D", "3D", "IMAX"],
    director: "Nag Ashwin",
    leadCast: ["Prabhas", "Amitabh Bachchan", "Kamal Haasan", "Deepika Padukone"],
    synopsis: "A modern avatar of Vishnu descends to Earth to protect the world from evil forces in a dystopian world.",
  },
  {
    id: "mov-08",
    title: "Stree 2",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    language: "Hindi",
    genre: ["Comedy", "Horror"],
    rating: "UA",
    runtime: "147 mins",
    releaseDate: "2024-08-15",
    status: "Now Showing",
    formats: ["2D", "Dolby Atmos"],
    director: "Amar Kaushik",
    leadCast: ["Rajkummar Rao", "Shraddha Kapoor", "Pankaj Tripathi"],
    synopsis: "The town of Chanderi is haunted once again, this time by a headless entity named Sarkata.",
  },
  {
    id: "mov-09",
    title: "Joker: Folie à Deux",
    poster: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=1200&auto=format&fit=crop&q=80",
    language: "English",
    genre: ["Crime", "Drama", "Musical"],
    rating: "A",
    runtime: "138 mins",
    releaseDate: "2024-10-04",
    status: "Now Showing",
    formats: ["2D", "IMAX"],
    director: "Todd Phillips",
    leadCast: ["Joaquin Phoenix", "Lady Gaga"],
    synopsis: "Arthur Fleck meets the love of his life while incarcerated at Arkham State Hospital.",
  },
  {
    id: "mov-10",
    title: "Deadpool & Wolverine",
    poster: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&auto=format&fit=crop&q=80",
    language: "English / Hindi",
    genre: ["Action", "Comedy", "Sci-Fi"],
    rating: "A",
    runtime: "128 mins",
    releaseDate: "2024-07-26",
    status: "Now Showing",
    formats: ["2D", "3D", "4DX"],
    director: "Shawn Levy",
    leadCast: ["Ryan Reynolds", "Hugh Jackman"],
    synopsis: "Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool.",
  },
  {
    id: "mov-11",
    title: "Spider-Man: Beyond the Spider-Verse",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    language: "English / Hindi",
    genre: ["Animation", "Action", "Adventure"],
    rating: "U",
    runtime: "140 mins",
    releaseDate: "2025-06-15",
    status: "Upcoming",
    formats: ["2D", "3D", "IMAX"],
    director: "Joaquim Dos Santos",
    leadCast: ["Shameik Moore", "Hailee Steinfeld"],
    synopsis: "The conclusion to the epic multiverse adventure of Miles Morales.",
  },
  {
    id: "mov-12",
    title: "Mission: Impossible — Final Reckoning",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    language: "English",
    genre: ["Action", "Thriller"],
    rating: "UA",
    runtime: "155 mins",
    releaseDate: "2025-05-23",
    status: "Upcoming",
    formats: ["2D", "IMAX", "4DX"],
    director: "Christopher McQuarrie",
    leadCast: ["Tom Cruise", "Hayley Atwell", "Ving Rhames"],
    synopsis: "Ethan Hunt and the IMF team embark on their final, most dangerous mission.",
  },
];

export const THEATRE_SHOWS: TheatreShow[] = [
  {
    id: "sh-001",
    movieId: "mov-01",
    movieTitle: "Dune: Part Two",
    hallId: "hall-01",
    hallName: "Screen 01 — Dolby Cinema",
    date: "Today",
    startTime: "10:30 AM",
    endTime: "01:16 PM",
    language: "English",
    format: "Dolby Atmos",
    ticketPrice: 450,
    seatsBooked: 198,
    totalSeats: 220,
    status: "Completed",
  },
  {
    id: "sh-002",
    movieId: "mov-01",
    movieTitle: "Dune: Part Two",
    hallId: "hall-01",
    hallName: "Screen 01 — Dolby Cinema",
    date: "Today",
    startTime: "02:00 PM",
    endTime: "04:46 PM",
    language: "English",
    format: "Dolby Atmos",
    ticketPrice: 480,
    seatsBooked: 212,
    totalSeats: 220,
    status: "Completed",
  },
  {
    id: "sh-003",
    movieId: "mov-01",
    movieTitle: "Dune: Part Two",
    hallId: "hall-01",
    hallName: "Screen 01 — Dolby Cinema",
    date: "Today",
    startTime: "07:30 PM",
    endTime: "10:16 PM",
    language: "English",
    format: "Dolby Atmos",
    ticketPrice: 550,
    seatsBooked: 220,
    totalSeats: 220,
    status: "Running",
  },
  {
    id: "sh-004",
    movieId: "mov-01",
    movieTitle: "Dune: Part Two",
    hallId: "hall-01",
    hallName: "Screen 01 — Dolby Cinema",
    date: "Today",
    startTime: "10:45 PM",
    endTime: "01:31 AM",
    language: "English",
    format: "Dolby Atmos",
    ticketPrice: 520,
    seatsBooked: 184,
    totalSeats: 220,
    status: "Upcoming",
  },
  {
    id: "sh-005",
    movieId: "mov-02",
    movieTitle: "Oppenheimer",
    hallId: "hall-02",
    hallName: "Screen 02 — IMAX with Laser",
    date: "Today",
    startTime: "11:00 AM",
    endTime: "02:00 PM",
    language: "English",
    format: "IMAX",
    ticketPrice: 650,
    seatsBooked: 254,
    totalSeats: 260,
    status: "Completed",
  },
  {
    id: "sh-006",
    movieId: "mov-02",
    movieTitle: "Oppenheimer",
    hallId: "hall-02",
    hallName: "Screen 02 — IMAX with Laser",
    date: "Today",
    startTime: "03:15 PM",
    endTime: "06:15 PM",
    language: "English",
    format: "IMAX",
    ticketPrice: 700,
    seatsBooked: 260,
    totalSeats: 260,
    status: "Completed",
  },
  {
    id: "sh-007",
    movieId: "mov-02",
    movieTitle: "Oppenheimer",
    hallId: "hall-02",
    hallName: "Screen 02 — IMAX with Laser",
    date: "Today",
    startTime: "08:15 PM",
    endTime: "11:15 PM",
    language: "English",
    format: "IMAX",
    ticketPrice: 750,
    seatsBooked: 258,
    totalSeats: 260,
    status: "Running",
  },
  {
    id: "sh-008",
    movieId: "mov-03",
    movieTitle: "Interstellar",
    hallId: "hall-03",
    hallName: "Screen 03 — Prime Club",
    date: "Today",
    startTime: "06:45 PM",
    endTime: "09:34 PM",
    language: "English",
    format: "Dolby Atmos",
    ticketPrice: 380,
    seatsBooked: 122,
    totalSeats: 150,
    status: "Running",
  },
  {
    id: "sh-009",
    movieId: "mov-04",
    movieTitle: "Furiosa: A Mad Max Saga",
    hallId: "hall-04",
    hallName: "Screen 04 — 4DX Dynamic",
    date: "Today",
    startTime: "09:00 PM",
    endTime: "11:28 PM",
    language: "English",
    format: "4DX",
    ticketPrice: 680,
    seatsBooked: 110,
    totalSeats: 120,
    status: "Upcoming",
  },
  {
    id: "sh-010",
    movieId: "mov-08",
    movieTitle: "Stree 2",
    hallId: "hall-05",
    hallName: "Screen 05 — Royal Suite VIP",
    date: "Today",
    startTime: "08:45 PM",
    endTime: "11:12 PM",
    language: "Hindi",
    format: "2D",
    ticketPrice: 850,
    seatsBooked: 96,
    totalSeats: 100,
    status: "Upcoming",
  },
];

export const THEATRE_BOOKINGS: TheatreBooking[] = Array.from({ length: 25 }, (_, i) => {
  const movies = ["Dune: Part Two", "Oppenheimer", "Interstellar", "Stree 2", "Furiosa"];
  const halls = ["Screen 01 — Dolby Cinema", "Screen 02 — IMAX Laser", "Screen 03 — Prime Club", "Screen 04 — 4DX", "Screen 05 — Royal Suite"];
  const patrons = ["Aarav Mehta", "Pooja Sharma", "Rohan Joshi", "Ananya Deshmukh", "Vikram Malhotra", "Sneha Kulkarni", "Aditya Nair", "Kavya Patil", "Siddharth Rao", "Neha Verma"];
  const methods: ("UPI" | "Credit Card" | "Debit Card" | "Net Banking" | "Cash")[] = ["UPI", "Credit Card", "UPI", "Net Banking", "Debit Card"];

  return {
    id: `bk-${1000 + i}`,
    referenceCode: `BK-PUN-${8920 + i}`,
    customerName: patrons[i % patrons.length],
    customerEmail: `${patrons[i % patrons.length].toLowerCase().replace(" ", ".")}@gmail.com`,
    customerPhone: `+91 9820${i} 4492${i % 10}`,
    movieTitle: movies[i % movies.length],
    hallName: halls[i % halls.length],
    showTime: i % 2 === 0 ? "07:30 PM" : "08:15 PM",
    bookingDate: "Today, Nov 07",
    seats: [`D${(i % 12) + 1}`, `D${(i % 12) + 2}`],
    amount: (i % 3 === 0 ? 1100 : i % 2 === 0 ? 1500 : 880),
    paymentMethod: methods[i % methods.length],
    paymentStatus: i === 23 ? "Refunded" : "Paid",
    bookingStatus: i === 23 ? "Cancelled" : i < 15 ? "Checked-in" : "Confirmed",
  };
});

export const THEATRE_CUSTOMERS: TheatreCustomer[] = [
  {
    id: "cust-01",
    name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    email: "vikram.m@outlook.com",
    phone: "+91 98220 11984",
    loyaltyTier: "CineSphere VIP",
    totalBookings: 38,
    totalSpent: 42800,
    lastBooking: "Today",
    registrationDate: "2022-04-12",
    status: "VIP",
    preferredGenre: "Sci-Fi IMAX",
  },
  {
    id: "cust-02",
    name: "Ananya Deshmukh",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    email: "ananya.deshmukh@gmail.com",
    phone: "+91 94225 89012",
    loyaltyTier: "Platinum",
    totalBookings: 24,
    totalSpent: 26400,
    lastBooking: "Yesterday",
    registrationDate: "2023-01-18",
    status: "Active",
    preferredGenre: "Drama & Festivals",
  },
  {
    id: "cust-03",
    name: "Rohan Joshi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    email: "rohan.joshi88@yahoo.com",
    phone: "+91 98810 55412",
    loyaltyTier: "Gold",
    totalBookings: 16,
    totalSpent: 14200,
    lastBooking: "3 days ago",
    registrationDate: "2023-08-04",
    status: "Active",
    preferredGenre: "Action 4DX",
  },
  {
    id: "cust-04",
    name: "Sneha Kulkarni",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    email: "sneha.k@techmahindra.com",
    phone: "+91 99230 77124",
    loyaltyTier: "Gold",
    totalBookings: 14,
    totalSpent: 12800,
    lastBooking: "Nov 02",
    registrationDate: "2023-09-15",
    status: "Active",
    preferredGenre: "Hindi Horror Comedy",
  },
];

export const THEATRE_STAFF: TheatreStaff[] = [
  {
    id: "st-01",
    employeeCode: "EMP-PUN-001",
    name: "Rajesh Kulkarni",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    designation: "General Manager",
    role: "Theatre Admin",
    assignedHall: "All Screens (HQ)",
    email: "rajesh.kulkarni@cinesphere.io",
    phone: "+91 98220 00042",
    joiningDate: "2021-02-01",
    shift: "Morning (08:00 - 16:30)",
    status: "On Duty",
  },
  {
    id: "st-02",
    employeeCode: "EMP-PUN-002",
    name: "Deepak Shinde",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    designation: "Lead Projectionist & Sound Engineer",
    role: "Hall Manager",
    assignedHall: "Screen 02 — IMAX",
    email: "deepak.shinde@cinesphere.io",
    phone: "+91 98221 44589",
    joiningDate: "2021-05-15",
    shift: "Evening (16:00 - 00:30)",
    status: "On Duty",
  },
  {
    id: "st-03",
    employeeCode: "EMP-PUN-003",
    name: "Pooja Gaikwad",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
    designation: "Assistant Hall Manager",
    role: "Hall Manager",
    assignedHall: "Screen 01 — Dolby Cinema",
    email: "pooja.g@cinesphere.io",
    phone: "+91 98224 88124",
    joiningDate: "2022-01-10",
    shift: "Evening (16:00 - 00:30)",
    status: "On Duty",
  },
  {
    id: "st-04",
    employeeCode: "EMP-PUN-004",
    name: "Amitabh Phadke",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    designation: "Concessions & Food Court Lead",
    role: "Food Court Staff",
    assignedHall: "Concessions Central",
    email: "amitabh.p@cinesphere.io",
    phone: "+91 97650 11234",
    joiningDate: "2022-06-20",
    shift: "Morning (08:00 - 16:30)",
    status: "On Duty",
  },
  {
    id: "st-05",
    employeeCode: "EMP-PUN-005",
    name: "Sunita More",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    designation: "Senior Gate Usher & QR Attendant",
    role: "Floor Staff",
    assignedHall: "Screen 01 & 02 Concierge",
    email: "sunita.m@cinesphere.io",
    phone: "+91 94230 44901",
    joiningDate: "2023-03-01",
    shift: "Evening (16:00 - 00:30)",
    status: "On Duty",
  },
];

export const THEATRE_OFFERS: TheatreOffer[] = [
  {
    id: "off-01",
    title: "Diwali Weekend IMAX Blast",
    code: "DIWALIIMAX",
    category: "Festival Offers",
    discount: "₹150 OFF",
    description: "Get flat ₹150 off on IMAX Screen 02 tickets booked for evening shows.",
    validUntil: "2024-11-20",
    status: "Active",
    usageCount: 420,
  },
  {
    id: "off-02",
    title: "Gourmet Nachos + Tub Popcorn Combo",
    code: "PUNECOMB0",
    category: "Food Combos",
    discount: "25% OFF",
    description: "Save 25% when pre-ordering luxury cheese nachos with Mexican salsa.",
    validUntil: "2024-12-31",
    status: "Active",
    usageCount: 884,
  },
  {
    id: "off-03",
    title: "Pune College Student Wednesday",
    code: "CAMPUS50",
    category: "Student Discounts",
    discount: "Buy 1 Get 1",
    description: "Valid on all matinee shows before 04:00 PM with student ID verification.",
    validUntil: "2024-12-15",
    status: "Active",
    usageCount: 650,
  },
];

export const THEATRE_EVENTS: TheatreEvent[] = [
  {
    id: "ev-01",
    title: "Zakir Khan Live: Tathastu Special Tour",
    category: "Stand-up Comedy",
    date: "2024-11-22",
    time: "08:00 PM",
    hallName: "Screen 02 — IMAX Auditorium",
    price: 999,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    status: "Tickets Open",
    artist: "Zakir Khan",
  },
  {
    id: "ev-02",
    title: "Coldplay: Music of the Spheres (Broadcast)",
    category: "Concerts",
    date: "2024-12-05",
    time: "07:30 PM",
    hallName: "Screen 01 — Dolby Cinema",
    price: 650,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
    status: "Almost Full",
    artist: "Coldplay Live Band",
  },
];

export const THEATRE_TRANSACTIONS: TheatreTransaction[] = Array.from({ length: 15 }, (_, i) => ({
  id: `tx-pun-${9000 + i}`,
  bookingRef: `BK-PUN-${8920 + i}`,
  customer: i % 2 === 0 ? "Aarav Mehta" : "Pooja Sharma",
  amount: (i % 2 === 0 ? 1100 : 1500),
  paymentMethod: i % 3 === 0 ? "UPI" : "Credit Card",
  timestamp: `Today, 0${(i % 12) + 1}:24 PM`,
  status: "Success",
  gatewayRef: `HDFC_RAZOR_${883010 + i}`,
}));

export const THEATRE_NOTIFICATIONS: TheatreNotification[] = [
  {
    id: "notif-01",
    title: "Laser Projector Calibrated",
    message: "Screen 02 Christie CP4450 laser alignment completed with zero chromatic aberration.",
    type: "theatre",
    state: "unread",
    time: "10m ago",
    severity: "success",
  },
  {
    id: "notif-02",
    title: "Housefull Alert — Dune: Part Two",
    message: "07:30 PM Dolby Cinema show is 100% booked. Additional counter ushers dispatched.",
    type: "show",
    state: "unread",
    time: "25m ago",
    severity: "info",
  },
  {
    id: "notif-03",
    title: "HVAC Temperature Sensor Notice",
    message: "Screen 04 airflow adjusted to optimal 21.5°C before 4DX dynamic motion sequence.",
    type: "alert",
    state: "read",
    time: "1h ago",
    severity: "warning",
  },
];

export const THEATRE_SUPPORT_TICKETS: TheatreSupportTicket[] = [
  {
    id: "tkt-01",
    ticketNumber: "TKT-PUN-104",
    subject: "Screen 02 IMAX Audio Calibration Check",
    category: "Dolby Sound Rack",
    priority: "High",
    createdDate: "Today, 11:30 AM",
    assignedEngineer: "Deepak Shinde",
    status: "Resolved",
  },
  {
    id: "tkt-02",
    ticketNumber: "TKT-PUN-105",
    subject: "Concession POS Scanner #03 Bluetooth sync latency",
    category: "POS Terminal",
    priority: "Medium",
    createdDate: "Today, 02:15 PM",
    assignedEngineer: "Vendor On-Site Support",
    status: "In Progress",
  },
];

export const THEATRE_REPORTS: TheatreReport[] = [
  {
    id: "rep-01",
    title: "Daily Box Office Collection Ledger",
    category: "Daily Box Office",
    lastGenerated: "Today, 06:00 AM",
    period: "Nov 06 - Nov 07",
    fileSize: "2.4 MB",
    status: "Ready",
  },
  {
    id: "rep-02",
    title: "Screen-by-Screen Occupancy Breakdown",
    category: "Occupancy",
    lastGenerated: "Yesterday",
    period: "Weekly Audit",
    fileSize: "4.1 MB",
    status: "Ready",
  },
  {
    id: "rep-03",
    title: "F&B Concessions Gross Margin Yield",
    category: "Concessions",
    lastGenerated: "2 days ago",
    period: "Monthly Cycle",
    fileSize: "1.8 MB",
    status: "Ready",
  },
];

